@echo off
pushd
cd %~dp0
node package win32 x64
popd
