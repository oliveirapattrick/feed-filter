const LOCAL_APP_URL = "http://localhost:5123";

const ERROR_OFFLINE = { status: "error", message: "App local não está rodando. Abra o Feed Filter App." };

async function checkAppRunning() {
  try {
    const res = await fetch(`${LOCAL_APP_URL}/status`);
    const data = await res.json();
    return data.running === true;
  } catch {
    return false;
  }
}

async function downloadVideo(url) {
  try {
    const res = await fetch(`${LOCAL_APP_URL}/download`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    return await res.json();
  } catch {
    return ERROR_OFFLINE;
  }
}

async function transcribeVideo(url) {
  try {
    const res = await fetch(`${LOCAL_APP_URL}/transcribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    return await res.json();
  } catch {
    return ERROR_OFFLINE;
  }
}

window.FeedFilterAPI = { checkAppRunning, downloadVideo, transcribeVideo };
