# Pulse

A simple, no frills process and memory profiler for Mac that is built in Rust and Typescript

## Description

![Pulse Demo](.github/assets/pulse-readme-demo.png)

Made to quickly kill unresponsive applications and debug memory issues without the clutter of default system montioring applications

### Memory

Calculates most memory statistics using `vm_stats`  
Except for app memory which is a combination of pages pagable from kernel parameter `vm.page_pageable_internal_count` - `Pages purgeable` from vm_stats, designed to replicate activity montior.

### Process

Uses crate `sysinfo` to grab process data from OS

## Getting Started

### Quickstart

Download the latest release [here](https://github.com/aaron-wu1/Pulse/releases) and follow install instructions
