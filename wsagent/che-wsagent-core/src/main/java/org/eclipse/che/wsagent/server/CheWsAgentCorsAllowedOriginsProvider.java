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
package org.eclipse.che.wsagent.server;

import com.google.common.base.MoreObjects;
import com.google.inject.Inject;
import com.google.inject.Provider;
import javax.inject.Named;
import javax.ws.rs.core.UriBuilder;
import org.eclipse.che.api.core.model.workspace.Runtime;
import org.eclipse.che.api.core.model.workspace.runtime.Machine;
import org.eclipse.che.api.core.model.workspace.runtime.Server;
import org.eclipse.che.api.project.server.impl.WorkspaceProjectSynchronizer;
import org.eclipse.che.commons.annotation.Nullable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Provider of "cors.allowed.origins" setting for CORS Filter of WS Agent. Provides the value of WS
 * Master domain, by inferring it from "che.api" property
 */
public class CheWsAgentCorsAllowedOriginsProvider implements Provider<String> {

  private static final Logger LOG =
      LoggerFactory.getLogger(CheWsAgentCorsAllowedOriginsProvider.class);
  private final String allowedOrigins;

  @Inject
  public CheWsAgentCorsAllowedOriginsProvider(
      @Named("che.api.external") String cheApi,
      @Nullable @Named("che.wsagent.cors.allowed_origins") String allowedOrigins,
      WorkspaceProjectSynchronizer workspaceProjectSynchronizer) {
    if (allowedOrigins == null) {
      String ideServer =
          MoreObjects.firstNonNull(getIdeUrl(workspaceProjectSynchronizer.getRuntime()), cheApi);

      this.allowedOrigins = UriBuilder.fromUri(ideServer).replacePath(null).build().toString();
    } else {
      this.allowedOrigins = allowedOrigins;
    }
  }

  @Override
  public String get() {
    LOG.info("allowedOrigins {} ", allowedOrigins);
    return allowedOrigins;
  }

  private String getIdeUrl(Runtime runtime) {

    if (runtime != null) {
      for (Machine machine : runtime.getMachines().values()) {
        for (Server server : machine.getServers().values()) {
          if ("ide".equals(server.getAttributes().get("type"))) {
            LOG.info("Found ide server {}", server);
            return server.getUrl();
          }
        }
      }
    }

    return null;
  }
}
