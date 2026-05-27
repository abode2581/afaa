import express from 'express';
import cors from 'cors';
import { Client, GatewayIntentBits } from 'discord.js';

const app = express();
app.use(cors());
app.use(express.json());

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.DirectMessages
    ]
});

const verificationCodes = new Map();

client.on('ready', () => {
    console.log(`✅ البوت شغال: ${client.user.tag}`);
});

// إرسال رمز التحقق للمستخدم
app.post('/api/send-verification', async (req, res) => {
    const { discordId } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    try {
        const user = await client.users.fetch(discordId);
        await user.send(`🔐 رمز التحقق الخاص بك: ${code}\nأدخل هذا الرمز في الموقع لإكمال التسجيل.`);
        verificationCodes.set(discordId, { code, expires: Date.now() + 900000 });
        res.json({ success: true, message: 'تم إرسال الرمز' });
    } catch (error) {
        res.json({ success: false, message: 'لم يتم إرسال الرمز. تأكد من أن المستخدم يقبل الرسائل الخاصة' });
    }
});

// التحقق من صحة الرمز
app.post('/api/verify-code', (req, res) => {
    const { discordId, code } = req.body;
    const stored = verificationCodes.get(discordId);
    
    if (!stored) {
        return res.json({ success: false, message: 'لم يتم طلب رمز لهذا الحساب' });
    }
    if (Date.now() > stored.expires) {
        verificationCodes.delete(discordId);
        return res.json({ success: false, message: 'انتهت صلاحية الرمز' });
    }
    if (stored.code !== code) {
        return res.json({ success: false, message: 'الرمز غير صحيح' });
    }
    
    verificationCodes.delete(discordId);
    res.json({ success: true, message: 'تم التحقق بنجاح' });
});

client.login(process.env.MTUwOTE2MDE0NTQwMDEwNzAyOQ.GB1bNl.ColkAwrf6D5vlYmssH943niOoie577SWt8ki9U);
app.listen(process.env.PORT || 3000, () => console.log('🚀 السيرفر شغال على port 3000'));
