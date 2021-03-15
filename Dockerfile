FROM openjdk:8-buster

ENV POSTGRES_HOST=localhost
ENV POSTGRES_SCHEMA=blockchain
ENV POSTGRES_USER=postchain
ENV POSTGRES_PASS=postchain

ENV CHAIN_IID=0

# Docker image is only used for local development, therefore, these keys won't be used in a proper deployment.
ENV MESSAGING_PUBKEY=0350fe40766bc0ce8d08b3f5b810e49a8352fdd458606bd5fafe5acdcdc8ff3f57
ENV MESSAGING_PRIVKEY=3132333435363738393031323334353637383930313233343536373839303131

ENV DIR=/usr/src/testchain

COPY rell $DIR/rell
COPY docker/entrypoint.sh $DIR

WORKDIR $DIR/rell

RUN chmod +x *.sh

RUN ls -ln

RUN ./download-binaries.sh

WORKDIR $DIR

ENTRYPOINT ["/bin/bash", "entrypoint.sh"]
