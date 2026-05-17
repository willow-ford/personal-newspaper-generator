function runDailyNewsCollection() {
  const props = PropertiesService.getScriptProperties();
  const endpoint = props.getProperty("AGENT_ENDPOINT_URL");
  const token = props.getProperty("AGENT_ENDPOINT_TOKEN");
  const notificationWebhookUrl = props.getProperty("NOTIFICATION_WEBHOOK_URL");

  if (!endpoint) {
    throw new Error("AGENT_ENDPOINT_URL is not configured.");
  }
  if (!token) {
    throw new Error("AGENT_ENDPOINT_TOKEN is not configured.");
  }

  const payload = {
    date: Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyy-MM-dd"),
    timezone: "Asia/Tokyo",
    trigger: "gas-time-based",
  };

  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
    headers: {
      Authorization: "Bearer " + token,
    },
  };

  const response = UrlFetchApp.fetch(endpoint, options);
  const status = response.getResponseCode();
  const body = response.getContentText() || "";

  if (status < 200 || status >= 300) {
    throw new Error("Agent request failed. status=" + status + " body=" + body);
  }

  let notionUrl = "";
  try {
    const data = JSON.parse(body);
    notionUrl = data.notionUrl || data.url || "";
  } catch (_error) {
    // レスポンス本文がプレーンテキストなら URL として扱う。
    notionUrl = body.trim();
  }

  if (notificationWebhookUrl && notionUrl) {
    notifyWebhook(notificationWebhookUrl, notionUrl);
  }

  Logger.log("News collection finished: " + (notionUrl || "no-url-returned"));
}

function notifyWebhook(webhookUrl, notionUrl) {
  // 任意のWebhookへ Notion URL を通知する。
  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({
      text: "本日のニュースまとめを作成しました。\n" + notionUrl,
      notionUrl: notionUrl,
    }),
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch(webhookUrl, options);
  if (response.getResponseCode() >= 300) {
    Logger.log("Webhook notify failed: " + response.getContentText());
  }
}
