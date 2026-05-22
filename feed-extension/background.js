const LOCAL_APP_URL = "http://localhost:5123";

const ERROR_OFFLINE = { status: "error", message: "App local não está rodando. Abra o Feed Filter App." };

function makeTimeoutError(seconds) {
  return { status: "error", message: `Timeout após ${seconds}s. O vídeo pode ser muito longo.` };
}

async function post(endpoint, body, timeoutMs = 30000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${LOCAL_APP_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    return await res.json();
  } catch (err) {
    return err.name === "AbortError" ? makeTimeoutError(timeoutMs / 1000) : ERROR_OFFLINE;
  } finally {
    clearTimeout(timeout);
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const { action, url } = message;

  if (action === "checkStatus") {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    fetch(`${LOCAL_APP_URL}/status`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => sendResponse({ running: data.running === true }))
      .catch(() => sendResponse({ running: false }))
      .finally(() => clearTimeout(timeout));
    return true;
  }

  if (action === "download") {
    post("/download", { url }).then(sendResponse);
    return true;
  }

  if (action === "transcribe") {
    post("/transcribe", { url }, 300000).then(sendResponse); // 5 min timeout
    return true;
  }

  if (action === "downloadCarousel") {
    const { urls } = message;
    console.log("[FeedFilter bg] downloadCarousel →", urls.length, "URLs");
    post("/download-direct", { urls })
      .then((res) => {
        console.log("[FeedFilter bg] downloadCarousel ←", JSON.stringify(res));
        sendResponse(res);
      })
      .catch((err) => {
        console.error("[FeedFilter bg] downloadCarousel erro:", err);
        sendResponse({ status: "error", message: String(err) });
      });
    return true;
  }

  if (action === "saveTranscription") {
    const { text, filename } = message;
    console.log("[FeedFilter bg] saveTranscription →", filename, "chars:", text?.length);
    post("/save-transcription", { text, filename })
      .then((res) => {
        console.log("[FeedFilter bg] saveTranscription ←", JSON.stringify(res));
        sendResponse(res);
      })
      .catch((err) => {
        console.error("[FeedFilter bg] saveTranscription erro:", err);
        sendResponse({ status: "error", message: String(err) });
      });
    return true;
  }
});
