#!/bin/bash

INSTANCE_IP=$1

ssh -i ~/.ssh/amazon.pem ubuntu@${INSTANCE_IP}
