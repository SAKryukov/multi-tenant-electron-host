#!/bin/bash
pushd $(dirname "$0")
node package win32 ia32
popd
