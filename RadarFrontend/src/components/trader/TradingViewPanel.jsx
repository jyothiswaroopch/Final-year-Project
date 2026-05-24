import { useEffect, useId, useRef, useState } from 'react';

const symbolCandidates = {
  // Indian indices — NSE is blocked, use BSE equivalents
  'NIFTY 50':     ['BSE:SENSEX', 'BSESN'],
  'NIFTY50':      ['BSE:SENSEX', 'BSESN'],
  'NIFTY':        ['BSE:SENSEX', 'BSESN'],
  '^NSEI':        ['BSE:SENSEX', 'BSESN'],
  'BANKNIFTY':    ['BSE:BANKEX'],
  '^NSEBANK':     ['BSE:BANKEX'],
  'SENSEX':       ['BSE:SENSEX', 'BSESN'],
  '^BSESN':       ['BSE:SENSEX', 'BSESN'],
  'FINNIFTY':     ['BSE:FINEX'], // fallback
  'MIDCPNIFTY':   ['BSE:MIDCAP'],
  'NIFTY IT':     ['BSE:IT'],
  'NIFTY AUTO':   ['BSE:AUTO'],
  // Global
  'S&P 500':      ['SP:SPX', 'OANDA:SPX500USD'],
  'S&P 500 CFD':  ['OANDA:SPX500USD', 'SP:SPX'],
  'NASDAQ CFD':   ['OANDA:NAS100USD'],
  'BTC/USDT':     ['BINANCE:BTCUSDT', 'CRYPTO:BTCUSDT'],
  'BTCUSDT':      ['BINANCE:BTCUSDT'],
};

function buildCandidates(symbol) {
  const s = String(symbol || '').trim();
  if (!s) return [];
  const upper = s.toUpperCase();
  const direct = symbolCandidates[upper];
  const candidates = [];

  if (direct && Array.isArray(direct)) candidates.push(...direct);
  if (!direct) {
    const stripped = upper.replace(/^\^/, '').replace(/\.(NS|BO)$/i, '').replace(/\s+/g, '');
    candidates.push(`BSE:${stripped}`); // Exclusively use BSE since NSE is blocked
  }

  return [...new Set(candidates.filter(Boolean))];
}

function buildSrcFor(tvSym, frameId, interval) {
  let finalInterval = interval;
  // BSE indices and stocks only allow Daily+ intervals on TradingView free tier
  if (tvSym.startsWith('BSE:') && !['D', 'W', 'M'].includes(interval)) {
    finalInterval = 'D';
  }

  const params = new URLSearchParams({
    frameElementId: frameId,
    symbol: tvSym,
    interval: finalInterval,
    hidesidetoolbar: '1',
    symboledit: '0',
    saveimage: '0',
    toolbarbg: '0F172A',
    studies: '[]',
    theme: 'dark',
    style: '1',
    timezone: 'Asia/Kolkata',
    withdateranges: '1',
    hideideas: '1',
    locale: 'en',
  });

  return `https://s.tradingview.com/widgetembed/?${params.toString()}`;
}

const TradingViewPanel = ({ symbol, interval = '15', fallback = null, candidateTimeout = 3000, onStatusChange = null }) => {
  const [src, setSrc] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const [failed, setFailed] = useState(false);
  const [successSym, setSuccessSym] = useState(null);
  const containerId = `tv-${useId().replace(/:/g, '')}`;
  const successRef = useRef(false);
  const timersRef = useRef([]);
  const onStatusChangeRef = useRef(onStatusChange);

  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  useEffect(() => {
    successRef.current = false;
    setFailed(false);
    setSuccessSym(null);
    setActiveIdx(0);
    setSrc('');
    onStatusChangeRef.current?.('trying');

    const candidates = buildCandidates(symbol);
    const id = containerId;
    if (candidates.length === 0) {
      setFailed(true);
      onStatusChangeRef.current?.('fallback');
      return;
    }

    let mounted = true;

    const tryCandidate = (index) => {
      if (!mounted) return;
      if (index >= candidates.length) {
        setFailed(true);
        onStatusChangeRef.current?.('fallback');
        return;
      }

      const tvSym = candidates[index];
      onStatusChangeRef.current?.('trying');
      const finalSrc = buildSrcFor(tvSym, id, interval);
      setActiveIdx(index);
      setSrc(finalSrc);

      // After candidateTimeout, if not successful, try next
      const t = setTimeout(() => {
        if (!successRef.current) {
          tryCandidate(index + 1);
        }
      }, candidateTimeout);
      timersRef.current.push(t);
    };

    tryCandidate(0);

    return () => {
      mounted = false;
      timersRef.current.forEach(t => clearTimeout(t));
      timersRef.current = [];
    };
  }, [symbol, interval, candidateTimeout, containerId]);

  return (
    <div className="h-full w-full rounded-xl overflow-hidden bg-[#0F172A] relative">
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">No widget available</div>
        )
      ) : (
        <>
          {!successSym && (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
              Probing TradingView symbol {activeIdx + 1}
            </div>
          )}
          {src && (
            <iframe
              id={containerId}
              title={`TradingView-${symbol}`}
              src={src}
              width="100%"
              height="100%"
              frameBorder="0"
              allowTransparency
              scrolling="no"
              onLoad={() => {
                successRef.current = true;
                setSuccessSym(symbol);
                timersRef.current.forEach(t => clearTimeout(t));
                timersRef.current = [];
                onStatusChangeRef.current?.('live');
              }}
              onError={() => {
                successRef.current = false;
                setFailed(true);
                onStatusChangeRef.current?.('fallback');
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default TradingViewPanel;
