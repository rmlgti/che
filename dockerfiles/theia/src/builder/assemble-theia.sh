#!/bin/sh
#
# Copyright (c) 2018-2018 Red Hat, Inc.
# This program and the accompanying materials are made
# available under the terms of the Eclipse Public License 2.0
# which is available at https://www.eclipse.org/legal/epl-2.0/
#
# SPDX-License-Identifier: EPL-2.0
#
# Contributors:
#   Red Hat, Inc. - initial API and implementation
#

set -e
set -u

# Start npmjs repository
cd ${HOME}/verdaccio
verdaccio &
sleep 3

# Build Theia with all the extensions
cd ${HOME} && npm install html-webpack-plugin@^3.2.0 yargs@^12.0.4
cd ${HOME} && yarn && yarn theia build --config customization/custom.webpack.config.js --env.cdn="${CDN_PREFIX:-}" --env.monacocdn=https://cdn.jsdelivr.net/npm/@typefox/monaco-editor-core@0.14.6/min/
mv ${HOME}/lib/vs/loader.js ${HOME}/lib/vs/original-loader.js
mv ${HOME}/customization/vs-loader.js ${HOME}/lib/vs/loader.js