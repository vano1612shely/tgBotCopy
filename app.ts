import { Telegraf, session } from "telegraf";

const bot = new Telegraf("6292118007:AAF2wEBMrPUKpS5rxvl23zxfkHzBJFrmQMU");
// Визначте ідентифікатор каналу, з якого ви хочете копіювати повідомлення
const sourceChannelId = "-1002133750931";

// Визначте ідентифікатори каналів, куди ви хочете надсилати копії повідомлень
const destinationChannelIds = ["-1002084827801"];
const mediaGroups: any = {};
// Прослуховування нових повідомлень у вихідному каналі
const initiatedMediaGroup: any = {};

bot.on("channel_post", async (ctx) => {
  const message = ctx.channelPost;

  if (message.chat.id.toString() === sourceChannelId) {
    if (message.media_group_id) {
      // Перевірка, чи вже був ініційований процес відправки для цієї медіа групи
      if (!initiatedMediaGroup[message.media_group_id]) {
        initiatedMediaGroup[message.media_group_id] = true;

        // Встановлення таймера на 2 секунди для очікування інших повідомлень в групі
        setTimeout(async () => {
          //@ts-ignore
          const savedMessages = mediaGroups[message.media_group_id];
          if (savedMessages && savedMessages.length > 0) {
            for (const destinationChannelId of destinationChannelIds) {
              try {
                await sendMediaGroup(destinationChannelId, savedMessages);
              } catch (error) {
                console.error(
                  `Error sending media group to channel ${destinationChannelId}:`,
                  error,
                );
              }
            }
            // Після відправлення медіа групи очищуємо дані про media_group_id
            //@ts-ignore
            delete mediaGroups[message.media_group_id];
            //@ts-ignore
            delete initiatedMediaGroup[message.media_group_id];
          }
        }, 2000); // Таймер на 2 секунди
      }

      // Додавання поточного повідомлення до збережених повідомлень
      if (!mediaGroups[message.media_group_id]) {
        mediaGroups[message.media_group_id] = [];
      }
      mediaGroups[message.media_group_id].push(message);
    } else {
      // Якщо це не медіа група, надішліть повідомлення по одному
      for (const destinationChannelId of destinationChannelIds) {
        try {
          await sendCopyMessage(destinationChannelId, message);
        } catch (error) {
          console.error(
            `Error sending message to channel ${destinationChannelId}:`,
            error,
          );
        }
      }
    }
  }
});
// Функція для відправлення медіа групи в призначений канал
async function sendMediaGroup(destinationChannelId: string, messages: any) {
  const media = [];
  for (const message of messages) {
    if (message.photo) {
      // Якщо це фото, додайте його до масиву медіафайлів
      media.push({
        type: "photo",
        media: message.photo[0].file_id,
        caption: message.caption, // Додайте підпис, якщо він існує
      });
    } else if (message.video) {
      // Якщо це відео, додайте його до масиву медіафайлів
      media.push({
        type: "video",
        media: message.video.file_id,
        caption: message.caption, // Додайте підпис, якщо він існує
      });
    }
    // Додайте інші умови для інших типів медіа, якщо потрібно
  }

  // Відправте медіа групу в призначений канал
  //@ts-ignore
  await bot.telegram.sendMediaGroup(destinationChannelId, media);

  console.log(
    `Media group successfully sent to channel ${destinationChannelId}`,
  );
}

// Функція для надсилання копії повідомлення в призначений канал
async function sendCopyMessage(destinationChannelId: string, message: any) {
  const copiedMessage = await bot.telegram.copyMessage(
    destinationChannelId,
    sourceChannelId,
    message.message_id,
  );

  // Додаткові опції можуть бути додані тут, наприклад, реакція на успішну надсилання
  console.log(`Повідомлення успішно надіслано в канал ${destinationChannelId}`);
}

bot
  .launch()
  .then(() => {
    console.log("Bot started");
  })
  .catch((err) => console.error(err));
