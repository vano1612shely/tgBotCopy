import { Telegraf, session } from "telegraf";

const bot = new Telegraf("token");
const sourceChannelId = "sourceChannelId";
const destinationChannelIds = ["destinationChannelId"];
const mediaGroups: any = {};
const initiatedMediaGroup: any = {};

bot.on("channel_post", async (ctx) => {
  const message = ctx.channelPost;

  if (message.chat.id.toString() === sourceChannelId) {
    if (message.media_group_id) {
      if (!initiatedMediaGroup[message.media_group_id]) {
        initiatedMediaGroup[message.media_group_id] = true;
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
            //@ts-ignore
            delete mediaGroups[message.media_group_id];
            //@ts-ignore
            delete initiatedMediaGroup[message.media_group_id];
          }
        }, 2000);
      }
      if (!mediaGroups[message.media_group_id]) {
        mediaGroups[message.media_group_id] = [];
      }
      mediaGroups[message.media_group_id].push(message);
    } else {
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
async function sendMediaGroup(destinationChannelId: string, messages: any) {
  const media = [];
  for (const message of messages) {
    if (message.photo) {
      media.push({
        type: "photo",
        media: message.photo[0].file_id,
        caption: message.caption,
      });
    } else if (message.video) {
      media.push({
        type: "video",
        media: message.video.file_id,
        caption: message.caption,
      });
    }
  }
  //@ts-ignore
  await bot.telegram.sendMediaGroup(destinationChannelId, media);

  console.log(
    `Media group successfully sent to channel ${destinationChannelId}`,
  );
}
async function sendCopyMessage(destinationChannelId: string, message: any) {
  const copiedMessage = await bot.telegram.copyMessage(
    destinationChannelId,
    sourceChannelId,
    message.message_id,
  );
  console.log(`Повідомлення успішно надіслано в канал ${destinationChannelId}`);
}

bot
  .launch()
  .then(() => {
    console.log("Bot started");
  })
  .catch((err) => console.error(err));
