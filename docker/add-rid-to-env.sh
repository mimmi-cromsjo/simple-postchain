#!/usr/bin/env sh

RID=$(docker exec -i testchain cat rell/target/blockchains/0/brid.txt)

echo "Adding RID ${RID} to project .env"
echo "{ \"brid\": \"${RID}\" }" > ../config.json
