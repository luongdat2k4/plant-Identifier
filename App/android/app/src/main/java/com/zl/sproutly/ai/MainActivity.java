package com.zl.sproutly.ai;

import android.os.Bundle;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

import java.io.File;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class MainActivity extends BridgeActivity {
  // The ad SDK caches videos and scripts under files/al and never cleans it up (observed with AppLovin: 68 MB after a
  // few ads). Keep only the newest files up to this limit; user data lives elsewhere. A no-op when the folder is absent.
  private static final long AD_CACHE_LIMIT_BYTES = 30L * 1024 * 1024;

  @Override
    public void onCreate(Bundle savedInstanceState) {
        // Trim before the bridge starts: the SDK is not running yet, so no cached file is in use.
        trimAdCache(new File(getFilesDir(), "al"), AD_CACHE_LIMIT_BYTES);
        super.onCreate(savedInstanceState);

        // Ép bật DevTools (Inspect) trên Chrome cho app này
        WebView.setWebContentsDebuggingEnabled(true);
  }

  // Deletes the oldest files until the folder fits the limit.
  private static void trimAdCache(File dir, long limit) {
    if (!dir.isDirectory()) return;
    List<File> files = new ArrayList<>();
    collect(dir, files);
    long total = 0;
    for (File f : files) total += f.length();
    if (total <= limit) return;
    Collections.sort(files, (a, b) -> Long.compare(a.lastModified(), b.lastModified()));
    for (File f : files) {
      if (total <= limit) break;
      long size = f.length();
      if (f.delete()) total -= size;
    }
  }

  private static void collect(File dir, List<File> out) {
    File[] children = dir.listFiles();
    if (children == null) return;
    for (File child : children) {
      if (child.isDirectory()) collect(child, out);
      else out.add(child);
    }
  }
}
