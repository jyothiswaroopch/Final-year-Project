const fs = require('fs');
const path = require('path');

const backendDir = 'd:/myprojects/RADAR/radar-main-backend/src';
const frontendDir = 'd:/myprojects/RADAR/RadarFrontend/src';
const reportPath = 'd:/myprojects/RADAR/RADAR_Comprehensive_System_Report.md';

let report = '# RADAR: Comprehensive Full-Stack System Report\n\n';
report += '> This document contains an exhaustive structural and functional analysis of every major module in the RADAR platform across both the Node.js Backend and React Frontend.\n\n';

function crawl(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!['node_modules', 'dist', '.git', 'assets', 'public'].includes(file)) {
                crawl(fullPath, fileList);
            }
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            fileList.push(fullPath);
        }
    }
    return fileList;
}

const backendFiles = crawl(backendDir);
const frontendFiles = crawl(frontendDir);

report += '## 1. Executive Architecture Summary\n';
report += '- **Backend Framework**: Node.js, Express.js, Mongoose (MongoDB)\n';
report += '- **Frontend Framework**: React, Vite, Tailwind CSS, Recharts, Lucide Icons\n';
report += '- **Total Backend Modules Analyzed**: ' + backendFiles.length + '\n';
report += '- **Total Frontend Modules Analyzed**: ' + frontendFiles.length + '\n\n';

function extractFunctionsAndClasses(content) {
    const funcs = [...content.matchAll(/(?:async\s+)?function\s+([a-zA-Z0-9_]+)/g)].map(m => m[1]);
    const arrows = [...content.matchAll(/(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[a-zA-Z0-9_]+)\s*=>/g)].map(m => m[1]);
    const classes = [...content.matchAll(/class\s+([a-zA-Z0-9_]+)/g)].map(m => m[1]);
    return { functions: [...new Set([...funcs, ...arrows])].slice(0, 5), classes };
}

report += '## 2. Backend Subsystems Analysis\n\n';
let currentFolder = '';
for (const file of backendFiles) {
    const folder = path.basename(path.dirname(file));
    if (folder !== currentFolder) {
        report += '### 📁 ' + folder.toUpperCase() + ' Layer\n';
        currentFolder = folder;
    }
    const content = fs.readFileSync(file, 'utf8');
    const { functions, classes } = extractFunctionsAndClasses(content);
    
    report += '#### `' + path.basename(file) + '`\n';
    report += '- **Path**: `' + file.replace(/\\/g, '/').split('radar-main-backend/')[1] + '`\n';
    report += '- **Size**: ' + (content.length / 1024).toFixed(2) + ' KB\n';
    
    if (classes.length > 0) report += '- **Classes Provided**: ' + classes.join(', ') + '\n';
    if (functions.length > 0) report += '- **Core Operations**: ' + functions.join(', ') + '\n';
    
    if (content.includes('mongoose.Schema')) report += '- **Type**: MongoDB Database Schema definition.\n';
    if (content.includes('express.Router')) report += '- **Type**: Express Route handler establishing API endpoints.\n';
    if (content.includes('node-cron')) report += '- **Type**: Automated background scheduler.\n';
    if (content.includes('yahooFinance')) report += '- **Dependency**: Yahoo Finance API.\n';
    if (content.includes('finnhub')) report += '- **Dependency**: Finnhub Real-time API.\n';
    report += '\n';
}

report += '## 3. Frontend Component & View Analysis\n\n';
currentFolder = '';
for (const file of frontendFiles) {
    const folder = path.basename(path.dirname(file));
    if (folder !== currentFolder) {
        report += '### 📁 ' + folder.toUpperCase() + ' Domain\n';
        currentFolder = folder;
    }
    const content = fs.readFileSync(file, 'utf8');
    const { functions, classes } = extractFunctionsAndClasses(content);
    
    report += '#### `' + path.basename(file) + '`\n';
    report += '- **Path**: `' + file.replace(/\\/g, '/').split('RadarFrontend/')[1] + '`\n';
    report += '- **Size**: ' + (content.length / 1024).toFixed(2) + ' KB\n';
    
    if (content.includes('useState') || content.includes('useEffect')) {
        report += '- **Type**: Stateful React Component.\n';
    }
    if (content.includes('axios') || content.includes('api.')) {
        report += '- **Network**: Directly interfaces with backend APIs.\n';
    }
    if (content.includes('ResponsiveContainer') || content.includes('AreaChart')) {
        report += '- **Visualization**: Renders dynamic Recharts graphs.\n';
    }
    if (functions.length > 0) report += '- **Primary Functions**: ' + functions.join(', ') + '\n';
    report += '\n';
}

fs.writeFileSync(reportPath, report);
console.log('Report generated successfully at: ' + reportPath);
