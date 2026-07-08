package com.nebula.worker.service;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class WorkerServiceRetryTest {

    @Test
    public void testComputeRetryDelay_initial() {
        long d = WorkerService.computeRetryDelay(1, 1000L, 10000L, 2.0);
        assertEquals(1000L, d);
    }

    @Test
    public void testComputeRetryDelay_backoff() {
        long d2 = WorkerService.computeRetryDelay(2, 1000L, 10000L, 2.0);
        assertEquals(2000L, d2);
        long d3 = WorkerService.computeRetryDelay(3, 1000L, 10000L, 2.0);
        assertEquals(4000L, d3);
    }

    @Test
    public void testComputeRetryDelay_max() {
        long d = WorkerService.computeRetryDelay(10, 1000L, 5000L, 2.0);
        assertEquals(5000L, d);
    }
}
