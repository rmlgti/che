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
cd ${HOME} && yarn
MONACO_EDITOR_PACKAGE=$(yarn --json --non-interactive --no-progress list --pattern=@typefox/monaco-editor-core | jq --raw-output '.data.trees[0].name')
if [[ "$MONACO_CDN_PREFIX" == "" ]]; then
  MONACO_CDN=""
else
  case "${MONACO_EDITOR_PACKAGE}" in
  @typefox/monaco-editor-core@*)
    MONACO_CDN="${MONACO_CDN_PREFIX}${MONACO_EDITOR_PACKAGE}/min/";
    break
    ;;
  *)
    echo "Monaco editor core version not found !"
    exit 1
    ;;
  esac  
fi
yarn theia build --config customization/custom.webpack.config.js --env.cdn="${CDN_PREFIX:-}" --env.monacocdn="${MONACO_CDN}"
mv ${HOME}/lib/vs/loader.js ${HOME}/lib/vs/original-loader.js
mv ${HOME}/customization/vs-loader.js ${HOME}/lib/vs/loader.js