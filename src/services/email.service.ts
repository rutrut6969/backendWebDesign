import nodemailer from 'nodemailer';
import { environment } from '../config/environment';
import logger from '../utils/logger';
import { SuspensionCategory } from '../models/User';

class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: environment.emailUser,
                pass: environment.emailPassword
            }
        });
    }

    async sendPasswordResetEmail(email: string, token: string): Promise<void> {
        try {
            const resetLink = `${environment.clientUrl}/reset-password?token=${token}`;
            
            await this.transporter.sendMail({
                from: environment.emailUser,
                to: email,
                subject: 'Password Reset Request',
                html: this.getPasswordResetTemplate(resetLink)
            });
            
            logger.info(`Password reset email sent to ${email}`);
        } catch (error) {
            logger.error('Error sending password reset email:', error);
            throw new Error('Failed to send password reset email');
        }
    }

    async sendSuspensionEmail(
        email: string,
        name: string,
        reason: string,
        category: SuspensionCategory,
        endDate?: Date
    ): Promise<void> {
        try {
            await this.transporter.sendMail({
                from: environment.emailUser,
                to: email,
                subject: 'Account Suspension Notice',
                html: this.getSuspensionTemplate(name, reason, category, endDate)
            });
            
            logger.info(`Suspension email sent to ${email}`);
        } catch (error) {
            logger.error('Error sending suspension email:', error);
            throw new Error('Failed to send suspension email');
        }
    }

    async sendAccountRecoveryEmail(
        primaryEmail: string,
        recoveryEmail: string | undefined,
        token: string
    ): Promise<void> {
        try {
            const recoveryLink = `${environment.clientUrl}/account-recovery?token=${token}`;
            
            // Send to primary email
            await this.transporter.sendMail({
                from: environment.emailUser,
                to: primaryEmail,
                subject: 'Account Recovery Request',
                html: this.getAccountRecoveryTemplate(recoveryLink)
            });

            // If recovery email exists, send there too
            if (recoveryEmail) {
                await this.transporter.sendMail({
                    from: environment.emailUser,
                    to: recoveryEmail,
                    subject: 'Account Recovery Request',
                    html: this.getAccountRecoveryTemplate(recoveryLink)
                });
            }
            
            logger.info(`Account recovery email sent to ${primaryEmail}`);
        } catch (error) {
            logger.error('Error sending account recovery email:', error);
            throw new Error('Failed to send account recovery email');
        }
    }

    async send2FAEnabledEmail(email: string): Promise<void> {
        try {
            await this.transporter.sendMail({
                from: environment.emailUser,
                to: email,
                subject: 'Two-Factor Authentication Enabled',
                html: this.get2FAEnabledTemplate()
            });
            
            logger.info(`2FA enabled email sent to ${email}`);
        } catch (error) {
            logger.error('Error sending 2FA enabled email:', error);
            throw new Error('Failed to send 2FA enabled email');
        }
    }

    async send2FADisabledEmail(email: string): Promise<void> {
        try {
            await this.transporter.sendMail({
                from: environment.emailUser,
                to: email,
                subject: 'Two-Factor Authentication Disabled',
                html: this.get2FADisabledTemplate()
            });
            
            logger.info(`2FA disabled email sent to ${email}`);
        } catch (error) {
            logger.error('Error sending 2FA disabled email:', error);
            throw new Error('Failed to send 2FA disabled email');
        }
    }

    async send2FABackupCodesEmail(email: string, backupCodes: string[]): Promise<void> {
        try {
            await this.transporter.sendMail({
                from: environment.emailUser,
                to: email,
                subject: 'Your Two-Factor Authentication Backup Codes',
                html: this.get2FABackupCodesTemplate(backupCodes)
            });
            
            logger.info(`2FA backup codes email sent to ${email}`);
        } catch (error) {
            logger.error('Error sending 2FA backup codes email:', error);
            throw new Error('Failed to send 2FA backup codes email');
        }
    }

    async send2FALoginAlertEmail(email: string, deviceInfo: string, location: string): Promise<void> {
        try {
            await this.transporter.sendMail({
                from: environment.emailUser,
                to: email,
                subject: 'New Login with Two-Factor Authentication',
                html: this.get2FALoginAlertTemplate(deviceInfo, location)
            });
            
            logger.info(`2FA login alert email sent to ${email}`);
        } catch (error) {
            logger.error('Error sending 2FA login alert email:', error);
            throw new Error('Failed to send 2FA login alert email');
        }
    }

    private getPasswordResetTemplate(resetLink: string): string {
        return `
            <h1>Password Reset Request</h1>
            <p>You requested a password reset. Click the link below to reset your password:</p>
            <a href="${resetLink}">Reset Password</a>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
        `;
    }

    private getSuspensionTemplate(
        name: string,
        reason: string,
        category: SuspensionCategory,
        endDate?: Date
    ): string {
        return `
            <h1>Account Suspension Notice</h1>
            <p>Dear ${name},</p>
            <p>Your account has been suspended for the following reason:</p>
            <p><strong>${reason}</strong></p>
            <p>Category: ${category}</p>
            ${endDate ? `<p>Your suspension will end on: ${endDate.toLocaleDateString()}</p>` : ''}
            <p>If you believe this was done in error, please contact support.</p>
        `;
    }

    private getAccountRecoveryTemplate(recoveryLink: string): string {
        return `
            <h1>Account Recovery Request</h1>
            <p>You requested to recover your account. Click the link below to proceed:</p>
            <a href="${recoveryLink}">Recover Account</a>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't request this, please ignore this email and ensure your account is secure.</p>
        `;
    }

    private get2FAEnabledTemplate(): string {
        return `
            <h1>Two-Factor Authentication Enabled</h1>
            <p>Two-factor authentication has been successfully enabled for your account.</p>
            <p>Your account is now more secure! From now on, you'll need to enter a verification code when signing in.</p>
            <p>If you didn't enable 2FA, please contact support immediately.</p>
            <p>Keep your backup codes in a safe place - you'll need them if you lose access to your authenticator app.</p>
        `;
    }

    private get2FADisabledTemplate(): string {
        return `
            <h1>Two-Factor Authentication Disabled</h1>
            <p>Two-factor authentication has been disabled for your account.</p>
            <p>Your account is now less secure. We recommend enabling 2FA for additional security.</p>
            <p>If you didn't disable 2FA, please contact support immediately and change your password.</p>
        `;
    }

    private get2FABackupCodesTemplate(backupCodes: string[]): string {
        return `
            <h1>Your Backup Codes</h1>
            <p>Here are your backup codes for two-factor authentication. Keep these safe!</p>
            <p>Each code can only be used once:</p>
            <ul>
                ${backupCodes.map(code => `<li><code>${code}</code></li>`).join('\n')}
            </ul>
            <p><strong>Important:</strong></p>
            <ul>
                <li>Store these codes in a secure place</li>
                <li>Each code can only be used once</li>
                <li>Generate new codes if you run out or suspect they're compromised</li>
            </ul>
        `;
    }

    private get2FALoginAlertTemplate(deviceInfo: string, location: string): string {
        return `
            <h1>New Login Detected</h1>
            <p>A new login was just verified using two-factor authentication.</p>
            <p><strong>Device:</strong> ${deviceInfo}</p>
            <p><strong>Location:</strong> ${location}</p>
            <p>If this wasn't you, please:</p>
            <ol>
                <li>Change your password immediately</li>
                <li>Generate new 2FA backup codes</li>
                <li>Contact support</li>
            </ol>
        `;
    }

    // Add other email methods here (welcome email, notification email, etc.)
}

export const emailService = new EmailService();
