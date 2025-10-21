#!/bin/bash
pushd $(dirname "$0")
node package win32 x64
popd
