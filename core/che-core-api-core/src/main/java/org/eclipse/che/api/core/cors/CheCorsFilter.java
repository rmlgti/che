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
package org.eclipse.che.api.core.cors;

import com.google.inject.Singleton;
import java.io.IOException;
import javax.inject.Inject;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import org.apache.catalina.filters.CorsFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * The special filter which provides filtering requests in according to settings which are set to
 * {@link CorsFilter}. Uses {@link CheCorsFilterConfig} for providing configuration.
 *
 * @author Dmitry Shnurenko
 * @author Mykhailo Kuznietsov
 */
@Singleton
public class CheCorsFilter implements Filter {

  private static final Logger LOG = LoggerFactory.getLogger(CheCorsFilter.class);

  private CorsFilter corsFilter;

  @Inject private CheCorsFilterConfig cheCorsFilterConfig;

  @Override
  public void init(FilterConfig filterConfig) throws ServletException {
    corsFilter = new CorsFilter();

    corsFilter.init(cheCorsFilterConfig);
    LOG.info(
        "CORS initialized with parameters: 'cors.support.credentials': '{}', 'cors.allowed.origins': '{}'",
        cheCorsFilterConfig.getInitParameter("cors.support.credentials"),
        cheCorsFilterConfig.getInitParameter("cors.allowed.origins"));
  }

  @Override
  public void doFilter(
      ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain)
      throws IOException, ServletException {
    LOG.info("Before request {} ", ((HttpServletRequest) servletRequest).getRequestURI());
    try {
      corsFilter.doFilter(servletRequest, servletResponse, filterChain);
    } catch (Exception e) {
      LOG.error(e.getLocalizedMessage(), e);
    }
    LOG.info("After request {} ", ((HttpServletRequest) servletRequest).getRequestURI());
  }

  @Override
  public void destroy() {
    corsFilter.destroy();
  }
}
