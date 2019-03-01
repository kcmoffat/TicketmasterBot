#!/bin/bash

COUNT=$1

aws ec2 run-instances \
--image-id ami-0ac019f4fcb7cb7e6 \
--count $COUNT \
--instance-type t2.medium \
--key-name "kasey's keys" \
--subnet-id subnet-068da74771bbee3d5 \
--security-group-ids sg-040eec03796abd400 \
--user-data file://startup.sh \
--region us-east-1 \
--instance-initiated-shutdown-behavior terminate \
--iam-instance-profile Name=s3
