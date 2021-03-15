#!/bin/bash

# This script produces blockchain configurations which
# include Rell source code

set -eu

rm -rf target

echo "Compiling testchain..."
postchain-node/multigen.sh run.xml --source-dir=src --output-dir=target
echo "Successfully compiled testchain!"
