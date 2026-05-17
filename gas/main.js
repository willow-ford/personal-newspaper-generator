function runDailyNewsCollection() {
  const props = PropertiesService.getScriptProperties();
  const endpoint = props.getProperty("AGENT_ENDPOINT_URL");
  const token = props.getProperty("AGENT_ENDPOINT_TOKEN");
  const lineToken = props.getProperty("LINE_NOTIFY_TOKEN");

  if (!endpoint) {
    throw new Error("AGENT_ENDPOINT_URL is not configured.");
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
    headers: token
      ? {
          Authorization: "Bearer " + token,
        }
      : {},
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
    // レスポンス本文がプレーンテキストのケースはそのまま続行する。
  }

  if (lineToken && notionUrl) {
    notifyLine(lineToken, notionUrl);
  }

  Logger.log("News collection finished: " + (notionUrl || "no-url-returned"));
}

function notifyLine(lineToken, notionUrl) {
  // Notion URL を1メッセージで通知する。
  const options = {
    method: "post",
    headers: {
      Authorization: "Bearer " + lineToken,
    },
    payload: {
      message: "本日のニュースまとめを作成しました。\n" + notionUrl,
    },
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch("https://notify-api.line.me/api/notify", options);
  if (response.getResponseCode() >= 300) {
    Logger.log("LINE notify failed: " + response.getContentText());
  }
}
