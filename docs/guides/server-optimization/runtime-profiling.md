---
id: runtime-profiling
title: Runtime profiling
---

# @tramvai/module-performance-profile

The module provides debug [Papi](03-features/017-papi.md) handlers for collecting CPU and memory usage profiles on the server. These profiles can be analyzed in Chrome DevTools Profiler to investigate performance issues and memory leaks.

## Installation

You need to install `@tramvai/module-performance-profile`

```bash
yarn add @tramvai/module-performance-profile
```

And connect in the project

```tsx
import { createApp } from '@tramvai/core';

createApp({
  name: 'tincoin',
  modules: [
    ...(typeof window === 'undefined' && process.env.ENABLE_PERFORMANCE_PROFILE_MODULE === 'true'
      ? [require('@tramvai/module-performance-profile').PerformanceProfileModule]
      : []),
  ],
});
```

## Exported tokens

### `PERFORMANCE_PROFILE_OPTIONS_TOKEN`

Configuration options for the module. You can override the default temporary directory used for storing memory snapshots on the server by setting the `tmpDir` option.

## Explanation

The module provides private PAPI debugging endpoints for performance profiling and troubleshooting.

Local profiling is often not enough to detect real-world performance issues. Memory leaks and CPU bottlenecks may only appear under production traffic patterns, real user behavior, or specific infrastructure conditions that are difficult or impossible to reproduce locally.

To address this, the module allows collecting heap snapshots and CPU profiles directly from a running application deployed in Kubernetes environments, including staging and production.

### Memory Profiling

Memory profiling uses Node.js `inspector` module's [`Heap Profiler`](https://nodejs.org/api/inspector.html#heap-profiler) API to capture heap snapshots.

1. **Snapshot Creation** (`/takeMemorySnapshot`) - Initiates heap snapshot capture. Due to potentially long execution time, the request returns immediately while the snapshot is written to disk in the background.
2. **Snapshot Retrieval** (`/getMemorySnapshot`) - Downloads the captured snapshot file and automatically deletes it from the server after streaming.

### CPU Profiling

CPU profiling uses Node.js `inspector` module's [`CPU Profiler`](https://nodejs.org/api/inspector.html#cpu-profiler) API to capture execution profiles. The endpoint accepts an optional `duration` query parameter and returns the profile data directly as a downloadable `.cpuprofile` file.

## API

### Endpoints

All endpoints are private papi routes accessible for developers only.

#### `GET /{appName}/private/papi/takeMemorySnapshot`

Initiates creation of a heap snapshot for the running application.

:::note

This endpoint returns immediately. The actual snapshot is created asynchronously in the background. Use `/getMemorySnapshot` to retrieve the file once ready.

:::

#### `GET /{appName}/private/papi/getMemorySnapshot`

Retrieves the previously created heap snapshot file.

**Response:**

- Memory snapshot file compatible with the V8 DevTools profiling format (Content-Type: `application/octet-stream`)

#### `GET /{appName}/private/papi/getCpuProfile`

Captures a CPU profile for the specified duration.

**Query Parameters:**

- `duration` (optional) - Profiling duration in milliseconds. Default: 60000 (60s). Range: 100 - 120000

**Response:**

- CPU profile file compatible with the V8 DevTools profiling format (Content-Type: `application/octet-stream`)

## How to

### Capture a memory snapshot

1. Call `/{appName}/private/papi/takeMemorySnapshot` on the target pod
2. Wait a few minutes for the snapshot to be created
3. Call `/{appName}/private/papi/getMemorySnapshot` to download the snapshot
4. Open the `.heapsnapshot` file in Chrome DevTools Memory panel

:::note

In k8s environments with load balancing, you may need to make multiple requests to ensure they hit the same pod. Retry until successful.

:::

### Capture a CPU profile

1. Call `/{appName}/private/papi/getCpuProfile?duration=30000` for a 30-second profile
2. Download the `.cpuprofile` file
3. Open in Chrome DevTools Profiler tab

## Troubleshooting

### Heap snapshot creation may freeze the application

Creating a heap snapshot is a heavy operation and may freeze the Node.js process for a significant amount of time — sometimes several minutes for production workloads with high memory consumption.

Additionally, heap snapshot creation usually requires approximately the same amount of additional memory as currently consumed by the application process. Ensure that the container or node has enough available memory before starting the snapshot process.

The following sections describe the two most common infrastructure-related issues during heap snapshot creation:

:::warning

Use this functionality and the following infrastructure adjustments with caution, especially in production environments!

:::

1. **Kubernetes may restart the pod during snapshot creation**

   While the heap snapshot is being created, the application process may temporarily stop responding. Kubernetes may interpret this as an unhealthy container state and restart the pod before the snapshot is completed.

   To avoid this:

   - increase [livenessProbe](https://kubernetes.io/docs/concepts/workloads/pods/probes/#liveness-probe) timeouts or thresholds to allow the pod to stay alive long enough for snapshot generation;
   - adjust [readinessProbe](https://kubernetes.io/docs/concepts/workloads/pods/probes/#readiness-probe) settings so the pod stops receiving traffic while profiling is in progress.

   Tools such as [OpenLens](https://docs.k8slens.dev/) can be used to temporarily edit deployment configuration and adjust probe settings for the current deployment.

1. **Increase Node.js memory limits if necessary**

   Heap snapshot generation may require significantly more memory than the application normally uses.

   If the process is terminated with an out-of-memory error during snapshot creation, increase the Node.js heap limit using the [`--max-old-space-size`](https://nodejs.org/api/cli.html#max-old-space-sizesize-in-mib) flag.

### Kubernetes may restrict writes to temporary files during snapshot creation

If the application is running in a Kubernetes environment with `readOnlyRootFilesystem: true` enabled, the temporary directory used for snapshot creation may be read-only. In this case, add a volume mount for the directory used to store temporary snapshot files. For example:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  #...
spec:
  # ...
  template:
    spec:
      securityContext:
        # ...
      containers:
        - name: ...
          image: ...
          securityContext:
            readOnlyRootFilesystem: true
          volumeMounts:
            # Mount /tmp as writable ephemeral storage
            - name: tmp
              mountPath: /tmp
      volumes:
        # Define the emptyDir volume
        - name: tmp
          emptyDir: {}
```

### Proxy response timeout

Snapshot creation requests may take a long time to complete. In some environments, this can exceed the reverse proxy timeout and lead to interrupted requests or incomplete responses.

To prevent this, increase the reverse proxy timeout settings. For example, in Nginx you can increase `proxy_read_timeout`:

```
proxy_read_timeout 60s;
```

### Proxy buffering

Some reverse proxies buffer responses by default, which can delay or interrupt long-running snapshot creation requests. This may increase response time or prevent progress updates from being delivered correctly.

To avoid this, disable response buffering on the reverse proxy. For example, in Nginx you can disable `proxy_buffering` for the snapshot endpoint.

For `Nginx` configuration, disable [`proxy_buffering`](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_buffering):

```
proxy_buffering off;
```

### Access profiling endpoints directly from the cluster

Profiling endpoints are usually not exposed through the public application load balancer.

In Kubernetes environments, requests should typically be sent directly to the cluster network address. You may find you cluster address in application pipeline deployment logs.

If multiple pod replicas are running, requests may be routed to different pods by the Kubernetes service balancer. As a result, reading a previously generated snapshot may require several attempts until the request reaches the same pod where the snapshot was created.
