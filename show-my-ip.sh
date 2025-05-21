#!/bin/bash
echo "Your Local IP is: $(hostname -I | awk '{print $1}')"
