package com.example.backend.security;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Utilidades para extrair metadados da requisição HTTP
 * respeitando headers de reverse proxy (IIS/ARR, Nginx, etc).
 */
public final class RequestUtils {

    private RequestUtils() { }

    /**
     * Tenta extrair o IP real do cliente.
     * Ordem: X-Forwarded-For (primeiro da lista) → X-Real-IP → remoteAddr.
     */
    public static String clientIp(HttpServletRequest req) {
        if (req == null) return null;
        String xff = req.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            int comma = xff.indexOf(',');
            String first = (comma > 0 ? xff.substring(0, comma) : xff).trim();
            if (!first.isEmpty()) return first;
        }
        String realIp = req.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) return realIp.trim();
        return req.getRemoteAddr();
    }

    public static String userAgent(HttpServletRequest req) {
        if (req == null) return null;
        String ua = req.getHeader("User-Agent");
        if (ua == null) return null;
        return ua.length() > 500 ? ua.substring(0, 500) : ua;
    }
}
