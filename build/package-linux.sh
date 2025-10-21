#!/bin/bash
pushd $(dirname "$0")
node package linux x64
popd
