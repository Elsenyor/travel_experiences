import SubscribersModel from "../models/newsletter-subscribers.model.js";
import CampaignsModel from "../models/newsletter-campaigns.model.js";
import SendsModel from "../models/newsletter-sends.model.js";

/**
 * Newsletter Service
 * Handles business logic for newsletter operations
 */

/**
 * Process a newsletter campaign
 * Creates send records and sends emails to subscribers
 */
export const processCampaign = async (campaignId) => {
	try {
		// Get campaign details
		const campaign = await CampaignsModel.findById(campaignId);
		if (!campaign) {
			throw new Error("Campaign not found");
		}

		if (campaign.sent_date) {
			throw new Error("Campaign has already been sent");
		}

		// Get active subscribers with matching language preference
		const subscribers = await SubscribersModel.getActiveByLanguage(campaign.language);

		if (subscribers.length === 0) {
			throw new Error(`No active subscribers found for language: ${campaign.language}`);
		}

		// Create send records for each subscriber
		const subscriberIds = subscribers.map((sub) => sub.id);
		const sendIds = await SendsModel.createBulk(campaignId, subscriberIds);

		// TODO: Implement actual email sending using Nodemailer
		// For now, we'll simulate the process
		const results = await simulateEmailSending(sendIds, campaign, subscribers);

		// Mark campaign as sent
		await CampaignsModel.markAsSent(campaignId);

		return {
			campaignId,
			subscribersCount: subscribers.length,
			sendIds,
			results,
		};
	} catch (error) {
		throw new Error(`Error processing campaign: ${error.message}`);
	}
};

/**
 * Simulate email sending process
 * This will be replaced with actual Nodemailer implementation
 */
const simulateEmailSending = async (sendIds, campaign, subscribers) => {
	const results = {
		successful: 0,
		failed: 0,
		pending: 0,
	};

	for (let i = 0; i < sendIds.length; i++) {
		const sendId = sendIds[i];
		const subscriber = subscribers[i];

		try {
			// Simulate email sending (replace with actual Nodemailer code)
			// const emailResult = await sendEmail({
			//     to: subscriber.email,
			//     subject: campaign.subject,
			//     content: campaign.content,
			//     language: campaign.language
			// });

			// Simulate success/failure based on random chance
			const isSuccess = Math.random() > 0.1; // 90% success rate

			if (isSuccess) {
				await SendsModel.markAsSent(sendId);
				results.successful++;
			} else {
				await SendsModel.markAsFailed(sendId);
				results.failed++;
			}
		} catch (error) {
			await SendsModel.markAsFailed(sendId);
			results.failed++;
		}
	}

	return results;
};

/**
 * Get newsletter statistics
 */
export const getNewsletterStats = async () => {
	try {
		// Get total subscribers
		const allSubscribers = await SubscribersModel.getAllActive();
		const totalSubscribers = allSubscribers.length;

		// Get subscribers by language
		const spanishSubscribers = allSubscribers.filter((sub) => sub.preferred_language === "es").length;
		const englishSubscribers = allSubscribers.filter((sub) => sub.preferred_language === "en").length;

		// Get campaign statistics
		const campaigns = await CampaignsModel.findByFilters({});
		const totalCampaigns = campaigns.length;
		const sentCampaigns = campaigns.filter((c) => c.sent_date).length;
		const draftCampaigns = totalCampaigns - sentCampaigns;

		// Get overall send statistics
		let totalSends = 0;
		let successfulSends = 0;
		let failedSends = 0;

		for (const campaign of campaigns) {
			if (campaign.sent_date) {
				const stats = await SendsModel.getCampaignStats(campaign.id);
				totalSends += stats.total_sends;
				successfulSends += stats.successful_sends;
				failedSends += stats.failed_sends;
			}
		}

		return {
			subscribers: {
				total: totalSubscribers,
				spanish: spanishSubscribers,
				english: englishSubscribers,
			},
			campaigns: {
				total: totalCampaigns,
				sent: sentCampaigns,
				draft: draftCampaigns,
			},
			sends: {
				total: totalSends,
				successful: successfulSends,
				failed: failedSends,
				successRate: totalSends > 0 ? ((successfulSends / totalSends) * 100).toFixed(2) : 0,
			},
		};
	} catch (error) {
		throw new Error(`Error getting newsletter stats: ${error.message}`);
	}
};

/**
 * Add subscriber to newsletter
 */
export const addSubscriber = async (email, preferredLanguage = "es") => {
	try {
		// Check if subscriber already exists
		const existingSubscriber = await SubscribersModel.findByEmail(email);

		if (existingSubscriber) {
			if (existingSubscriber.status === "inactive") {
				// Reactivate subscriber
				await SubscribersModel.update(existingSubscriber.id, { status: "active" });
				return {
					status: "reactivated",
					subscriber: existingSubscriber,
					message: "Subscriber reactivated successfully",
				};
			} else {
				throw new Error("Email already subscribed");
			}
		}

		// Create new subscriber
		const subscriberId = await SubscribersModel.create({ email, preferred_language: preferredLanguage });
		const newSubscriber = await SubscribersModel.findById(subscriberId);

		return {
			status: "created",
			subscriber: newSubscriber,
			message: "Subscriber added successfully",
		};
	} catch (error) {
		throw new Error(`Error adding subscriber: ${error.message}`);
	}
};

/**
 * Remove subscriber from newsletter
 */
export const removeSubscriber = async (email) => {
	try {
		const subscriber = await SubscribersModel.findByEmail(email);

		if (!subscriber) {
			throw new Error("Subscriber not found");
		}

		await SubscribersModel.unsubscribe(email);

		return {
			status: "unsubscribed",
			message: "Subscriber unsubscribed successfully",
		};
	} catch (error) {
		throw new Error(`Error removing subscriber: ${error.message}`);
	}
};

/**
 * Update subscriber preferences
 */
export const updateSubscriberPreferences = async (subscriberId, updates) => {
	try {
		const subscriber = await SubscribersModel.findById(subscriberId);

		if (!subscriber) {
			throw new Error("Subscriber not found");
		}

		// Validate language if it's being updated
		if (updates.preferred_language && !["es", "en"].includes(updates.preferred_language)) {
			throw new Error("Invalid language preference");
		}

		const updated = await SubscribersModel.update(subscriberId, updates);

		if (!updated) {
			throw new Error("Failed to update subscriber");
		}

		const updatedSubscriber = await SubscribersModel.findById(subscriberId);

		return {
			status: "updated",
			subscriber: updatedSubscriber,
			message: "Subscriber preferences updated successfully",
		};
	} catch (error) {
		throw new Error(`Error updating subscriber preferences: ${error.message}`);
	}
};

export default {
	processCampaign,
	getNewsletterStats,
	addSubscriber,
	removeSubscriber,
	updateSubscriberPreferences,
};
