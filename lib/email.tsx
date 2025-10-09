import { Resend } from "resend"
import { env } from "./env"

// Initialize Resend client only if API key is available
const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null

interface SendInviteEmailParams {
	to: string
	inviteUrl: string
	organizationName: string
	inviterName: string
	roleName: string
}

export async function sendInviteEmail({
	to,
	inviteUrl,
	organizationName,
	inviterName,
	roleName,
}: SendInviteEmailParams) {
	// If no Resend API key, log to console (useful for development)
	if (!resend) {
		return { success: false, error: "Resend API key not configured" }
	}

	try {
		await resend.emails.send({
			from: "onboarding@resend.dev",
			to,
			subject: `You've been invited to join ${organizationName}`,
			html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You've been invited to join ${organizationName}</h2>
          <p>${inviterName} has invited you to join their organization as a <strong>${roleName}</strong>.</p>
          <p>Click the link below to accept the invitation:</p>
          <a href="${inviteUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Accept Invitation
          </a>
          <p style="color: #666; font-size: 14px;">This invitation will expire in 7 days.</p>
          <p style="color: #666; font-size: 14px;">If you didn't expect this invitation, you can safely ignore this email.</p>
        </div>
      `,
		})

		return { success: true }
	} catch (error) {
		console.error("[v0] Failed to send email:", error)
		return { success: false, error: "Failed to send email" }
	}
}
