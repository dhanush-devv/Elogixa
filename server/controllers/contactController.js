const Contact = require('../models/Contact');
const { sendContactNotificationEmail } = require('../services/emailService');

const dialogflowWebhook = async (req, res) => {
    try {
        console.log("Webhook Body:", JSON.stringify(req.body, null, 2));

        const queryResult = req.body.queryResult || {};
        const params = queryResult.parameters || {};
        const allParamsPresent = queryResult.allRequiredParamsPresent;

        const rawName = params['person'] || params['name'] || '';
        const name = typeof rawName === 'object' ? (rawName?.name || '') : rawName;
        const email = params.email || '';
        const rawCountry = params['geo-country'] || params['country'] || '';
        const country = typeof rawCountry === 'object' ? (rawCountry?.['country'] || rawCountry?.name || '') : rawCountry;
        const service = params.service || '';
        const message = params.message || '';
       

        // If not all params collected yet, let Dialogflow handle slot filling
        if (!allParamsPresent || !name || !email || !country || !service || !message) {
            return res.json({ fulfillmentText: '' });
        }
        


        await Contact.create({ name, email, country, service, message });

        await sendContactNotificationEmail({ name, email, country, service, message });

        return res.json({
            fulfillmentText: `Thank you, ${name}! 🙏 Your enquiry has been successfully received. Our team will review your request and get in touch with you at ${email} within 1–2 business days. We look forward to working with you!`
        });
    } catch (error) {
        console.error("Webhook error:", error);
        return res.json({
            fulfillmentText: "Something went wrong. Please try again later."
        });
    }
};

const submitContactMessage = async (req, res) => {
    try {
        const { name, email, country, service, message } = req.body;

        const contact = await Contact.create({
            name,
            email,
            country,
            service,
            message,
        });

        // Send email in background — don't block the response
        sendContactNotificationEmail({ name, email, country, service, message })
            .then(result => {
                if (!result.success) console.error('Contact email failed:', result.error);
            })
            .catch(err => console.error('Contact email error:', err));

        res.status(201).json({
            ...contact.toObject(),
            emailSent: true,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getAllMessages = async (req, res) => {
    try {
        const messages = await Contact.find({}).sort({ createdAt: -1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const deleteMessage = async (req, res) => {
    try {
        const msg = await Contact.findByIdAndDelete(req.params.id);
        if (!msg) return res.status(404).json({ message: 'Message not found' });
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const deleteAllMessages = async (req, res) => {
    try {
        const { before } = req.query;
        const filter = before ? { createdAt: { $lt: new Date(before) } } : {};
        const result = await Contact.deleteMany(filter);
        res.json({ message: `${result.deletedCount} message(s) deleted` });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    dialogflowWebhook,
    submitContactMessage,
    getAllMessages,
    deleteMessage,
    deleteAllMessages
};
