import nodemailer from 'nodemailer';
import { environment } from '../config/environment';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: environment.emailUser,
        pass: environment.emailPassword
    }
});

export const sendSuspensionEmail = async (
    to: string,
    name: string,
    reason: string,
    category: string,
    endDate?: Date
) => {
    const subject = `Account Suspended - ${category}`;
    
    const html = `
        <h1>Account Suspension Notice</h1>
        <p>Dear ${name},</p>
        <p>Your account has been suspended for the following reason:</p>
        <p><strong>${reason}</strong></p>
        <p>Category: ${category}</p>
        ${endDate ? `<p>Your suspension will end on: ${endDate.toLocaleDateString()}</p>` : 
                   '<p>This is an indefinite suspension.</p>'}
        <p>If you believe this was done in error, please contact support.</p>
    `;

    try {
        await transporter.sendMail({
            from: environment.emailUser,
            to,
            subject,
            html
        });
    } catch (error) {
        console.error('Error sending suspension email:', error);
    }
}; 