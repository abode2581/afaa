import express from 'express';
import { Client, GatewayIntentBits } from 'discord.js';

const app = express();
app.use(express.json());

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.DirectMessages
    ]
});

// تخزين الرموز المؤقتة
const codes = new Map();

client.once('ready', () => {
    console.log(`✅ البوت شغال يا حلو! مسجل كـ ${client.user.tag}`);
});

//端点: إرسال رمز التحقق
app.post('/api/send-verification', async (req, res) => {
    const { discordId } = req.body;
    
    if (!discordId) {
        return res.json({ success: false, message: 'الآيدي مطلوب' });
    }
    
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    try {
        const user = await client.users.fetch(discordId);
        await user.send(`🔐 **رمز التحقق الخاص بك:**\n\`\`\`\n${code}\n\`\`\`\nهذا الرمز صالح لمدة 10 دقائق.`);
        
        codes.set(discordId, {
            code: code,
            expires: Date.now() + 10 * 60 * 1000
        });
        
        res.json({ success: true, message: 'تم إرسال الرمز' });
    } catch (error) {
        console.error('خطأ في الإرسال:', error);
        res.json({ success: false, message: 'لم نتمكن من إرسال الرمز. تأكد من صحة الآيدي وأن المستخدم يقبل الرسائل الخاصة.' });
    }
});

//端点: التحقق من الرمز
app.post('/api/verify-code', (req, res) => {
    const { discordId, code } = req.body;
    
    const stored = codes.get(discordId);
    
    if (!stored) {
        return res.json({ success: false, message: 'لا يوجد رمز نشط لهذا الحساب' });
    }
    
    if (Date.now() > stored.expires) {
        codes.delete(discordId);
        return res.json({ success: false, message: 'انتهت صلاحية الرمز' });
    }
    
    if (stored.code !== code) {
        return res.json({ success: false, message: 'الرمز غير صحيح' });
    }
    
    codes.delete(discordId);
    res.json({ success: true, message: 'تم التحقق بنجاح' });
});

//端点: اختبار
app.get('/', (req, res) => {
    res.json({ status: 'online', bot: client.user?.tag || 'connecting...' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 السيرفر شغال على port ${PORT}`);
});

// تشغيل البوت
const TOKEN = process.env.DISCORD_TOKEN;
if (!TOKEN) {
    console.error('❌ خطأ: ما لقيت التوكن! تأكد من إضافة DISCORD_TOKEN في Variables');
    process.exit(1);
}

client.login(TOKEN);
