/*
 * Copyright (c) 2012-2018 Red Hat, Inc.
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Contributors:
 *   Red Hat, Inc. - initial API and implementation
 */
package org.eclipse.che.api.devfile.server.remote;

import com.google.common.io.CharStreams;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.net.HttpURLConnection;
import java.net.URL;
import javax.inject.Singleton;

@Singleton
public class RemoteDevfileRetriever {

  public String fromRepoUrl(String repoUrl, String branch) throws IOException {
    return requestContent(repoUrl + "/raw/" + branch + "/.devfile");
  }

  public String fromRawUrl(String rawUrl) throws IOException {
    return requestContent(rawUrl);
  }

  private String requestContent(String url) throws IOException {
    HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
    conn.setConnectTimeout(60000);
    conn.setReadTimeout(60000);
    try {
      final int responseCode = conn.getResponseCode();
      if ((responseCode / 100) != 2) {
        if (responseCode == HttpURLConnection.HTTP_MOVED_TEMP
            || responseCode == HttpURLConnection.HTTP_MOVED_PERM
            || responseCode == HttpURLConnection.HTTP_SEE_OTHER) {
          // reconnect again into new url
          String newUrl = conn.getHeaderField("Location");
          String cookies = conn.getHeaderField("Set-Cookie");
          conn = (HttpURLConnection) new URL(newUrl).openConnection();
          conn.setRequestProperty("Cookie", cookies);
        } else {
          throw new IOException(
              String.format(
                  "Failed to access devfile at: %s, response code: %d.", url, responseCode));
        }
      }
      try (Reader reader = new InputStreamReader(conn.getInputStream())) {
        return CharStreams.toString(reader);
      }
    } finally {
      conn.disconnect();
    }
  }
}
