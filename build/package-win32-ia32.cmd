@echo off
pushd
cd %~dp0
node package win32 ia32
popd
