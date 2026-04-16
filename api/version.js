const fs = require("fs");
const path = require("path");

function getProjectInfo() {
  const cmakePath = path.join(process.cwd(), "CMakeLists.txt");
  const fallback = {
    project: "LoaderExecutor",
    cmakeMinimum: "3.20",
    dependency: {
      name: "imgui",
      version: "1.91.0"
    }
  };

  if (!fs.existsSync(cmakePath)) {
    return fallback;
  }

  const cmakeRaw = fs.readFileSync(cmakePath, "utf8");
  const projectMatch = cmakeRaw.match(/project\(([^ )]+)/i);
  const cmakeMinMatch = cmakeRaw.match(/cmake_minimum_required\(VERSION\s+([^)]+)\)/i);
  const imguiMatch = cmakeRaw.match(/imgui\/archive\/refs\/tags\/v([0-9.]+)\.zip/i);

  return {
    project: projectMatch ? projectMatch[1] : fallback.project,
    cmakeMinimum: cmakeMinMatch ? cmakeMinMatch[1].trim() : fallback.cmakeMinimum,
    dependency: {
      name: "imgui",
      version: imguiMatch ? imguiMatch[1] : fallback.dependency.version
    }
  };
}

module.exports = (req, res) => {
  const info = getProjectInfo();
  const hasVersionQuery = Object.prototype.hasOwnProperty.call(req.query || {}, "v");


  if (hasVersionQuery) {
    const versionFromQuery = typeof req.query.v === "string" ? req.query.v.trim() : "";
    const noteFromQuery = typeof req.query.note === "string" ? req.query.note.trim() : "";
    const versionText = versionFromQuery || "8.1.0";
    const noteText = noteFromQuery || "[+] Optimize FPS ESP, New UI, update AimAssist";

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.status(200).send(`${versionText}\n${noteText}`);
    return;
  }

  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.status(200).json({
    ok: true,
    runtime: "vercel-serverless",
    repository: process.env.VERCEL_GIT_REPO_SLUG || "LoaderExecutorCpp",
    branch: process.env.VERCEL_GIT_COMMIT_REF || "local",
    commit: process.env.VERCEL_GIT_COMMIT_SHA || null,
    project: info.project,
    cmakeMinimum: info.cmakeMinimum,
    dependency: info.dependency,
    apiVersion: "v1",
    generatedAt: new Date().toISOString()
  });
};
