import express from 'express';
import { Client, GatewayIntentBits } from 'discord.js';

const app = express();
app.use(express.json());

console.log('1. بدأ تشغيل البوت...');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.DirectMessages
    ]
});

console.log('2. تم إنشاء عميل Discord');

client.once('ready', () => {
    console.log(`✅✅✅ البوت شغال بنجاح! اسمه: ${client.user.tag} ✅✅✅`);
});

client.on('error', (error) => {
    console.error('❌ خطأ في البوت:', error);
});

console.log('3. قبل محاولة تسجيل الدخول...');

const TOKEN = process.env.DISCORD_TOKEN;

if (!TOKEN) {
    console.error('❌❌❌ خطأ فادح: ما لقيت التوكن! تأكد من إضافة DISCORD_TOKEN في Variables');
    process.exit(1);
}

console.log('4. التوكن موجود، طوله:', TOKEN.length);

client.login(TOKEN);

console.log('5. تم طلب تسجيل الدخول...');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀🚀🚀 السيرفر شغال على port ${PORT} 🚀🚀🚀`);
});

app.get('/', (req, res) => {
    res.json({ status: 'alive', bot: client.user?.tag || 'connecting' });
});
