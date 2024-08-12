# @@@LICENSE
#
#      Copyright (c) 2018 LG Electronics, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# LICENSE@@@

cmake_minimum_required(VERSION 2.8.7)

project(flowmanager NONE)

include(webOS/webOS)

# modules
webos_modules_init(1 0 0 QUALIFIER RC2)
webos_component(1 0 0)

# bus
webos_build_system_bus_files()

# create/install flows.json (by using flows.json.in + webOS CMake configuration function)
set(WEBOS_INSTALL_DESTDIR ${WEBOS_INSTALL_WEBOS_SERVICESDIR}/com.webos.service.flowmanager)
webos_build_configured_file(files/flow/flows.json DESTDIR flow)

# launch
webos_build_configured_file(files/systemd/flowmgr.service SYSCONFDIR systemd/system)
webos_configure_source_files(launch_scripts files/systemd/flowmgr.sh)

# install
install(DIRECTORY nodes DESTINATION ${WEBOS_INSTALL_DESTDIR})
install(DIRECTORY certs DESTINATION ${WEBOS_INSTALL_DESTDIR})
install(FILES dist/index.js DESTINATION ${WEBOS_INSTALL_DESTDIR})
install(FILES dist/package.json DESTINATION ${WEBOS_INSTALL_DESTDIR})
install(PROGRAMS ${launch_scripts} DESTINATION ${WEBOS_INSTALL_SYSCONFDIR}/systemd/system/scripts)
