import { Resend } from 'resend'

// Initialize client (Nuxt automatically will pick up NUXT_RESEND_API_KEY from runtimeConfig if you set it up,
// or you can just use process.env for simplicity)
const resend = new Resend(process.env.RESEND_API_KEY)

interface SendInviteParams {
	to: string
	name: string
	studioName: string | null
	inviteLink: string
}

export const sendPractitionerInvite = async ({
	to,
	name,
	studioName,
	inviteLink,
}: SendInviteParams) => {
	// If we are on localhost (no production domain), intercept the email to our own inbox
	const isDev = process.env.NODE_ENV === 'development'

	if (isDev && !process.env.TEST_EMAIL_OVERRIDE) {
		return {
			success: false,
			error: new Error('TEST_EMAIL_OVERRIDE must be set in development'),
		}
	}

	const recipient =
		isDev && process.env.TEST_EMAIL_OVERRIDE
			? process.env.TEST_EMAIL_OVERRIDE
			: to

	try {
		const data = await resend.emails.send({
			from: `${studioName || 'Yogi'} <onboarding@resend.dev>`, // On production this will be no-reply@your-studio.com
			to: recipient,
			subject: `Welcome to ${studioName || 'a studio'} team. Click the link to set your password.`,
			// Simple HTML template for now. Then it's possible to use libs like Vue Email
			html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hello, ${name}!</h2>
          <p>The studio owner invites you to join the team as a practitioner.</p>
          <p>To activate your account and set a password, click the button below:</p>
          <a href="${inviteLink}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; margin-top: 16px;">
            Activate Account
          </a>
          <p style="margin-top: 32px; color: #666; font-size: 12px;">
            If the button doesn't work, copy this link into your browser: <br/>
            ${inviteLink}
          </p>
        </div>
      `,
		})

		return { success: true, data }
	} catch (error) {
		console.error('Error sending invite email:', error)
		return { success: false, error }
	}
}
