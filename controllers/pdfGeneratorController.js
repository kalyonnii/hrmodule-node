const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const pdfOutputDir = path.join(__dirname, '../pdfs');
if (!fs.existsSync(pdfOutputDir)) {
    fs.mkdirSync(pdfOutputDir);
}

const generatePdf = async (req, res) => {
    try {
        const {
            employeeName,
            employeeId,
            designation,
            basicSalary,
            dateOfJoining,
            totalDays,
            workedDays,
            employeePan,
            employeeAc,
            employeeIfsc,
            hra,
            allowances,
            grossEarnings,
            tds,
            pf,
            otherDeductions,
            totalDeductions,
            netPay,
            month,
            year
        } = req.body;

        console.log(req.body); 

        const templatePath = path.join(__dirname, '../pdfFormatTemplates', 'payslipformat.html');
        let template = fs.readFileSync(templatePath, 'utf-8');
        template = template
            .replace('{{employeeName}}', employeeName)
            .replace('{{designation}}', designation)
            .replace('{{basicSalary}}', basicSalary)
            .replace('{{dateOfJoining}}', dateOfJoining)
            .replace('{{totalDays}}', totalDays)
            .replace('{{workedDays}}', workedDays)
            .replace('{{employeePan}}', employeePan)
            .replace('{{employeeAc}}', employeeAc)
            .replace('{{employeeIfsc}}', employeeIfsc)
            .replace('{{hra}}', hra)
            .replace('{{allowances}}', allowances)
            .replace('{{grossEarnings}}', grossEarnings)
            .replace('{{tds}}', tds)
            .replace('{{otherDeductions}}', otherDeductions)
            .replace('{{totalDeductions}}', totalDeductions)
            .replace('{{pf}}', pf)
            .replace('{{netPay}}', netPay)
            .replace('{{month}}', month)
            .replace('{{year}}', year);

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(template, { waitUntil: 'networkidle0' }); 
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

        console.log(`PDF Buffer Length: ${pdfBuffer.length}`);
        await browser.close();
        const outputFilePath = path.join(pdfOutputDir, `${employeeId}_payslip.pdf`);
        fs.writeFileSync(outputFilePath, pdfBuffer);
        console.log(`PDF saved at: ${outputFilePath}`);
        res.setHeader('Content-Disposition', `attachment; filename=${employeeId}_payslip.pdf`);
        res.setHeader('Content-Type', 'application/pdf');
        res.send(pdfBuffer); 
        console.log('PDF sent to client');
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Error generating PDF');
    }
};

module.exports = {
    generatePdf,
};
