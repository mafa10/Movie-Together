package com.movietogether.config;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * CORS implementado como Filter manual en vez de WebMvcConfigurer.
 * Railway (la plataforma donde vive el backend) tiene un comportamiento
 * documentado donde su proxy de borde interfiere con el manejo de CORS
 * "declarativo" de Spring. Respondiendo los headers a mano y devolviendo
 * 200 directo ante un OPTIONS, se evita ese problema.
 */
@Component
public class CorsConfig implements Filter {

    // Lista separada por comas. Por defecto trae los puertos de desarrollo local
    // (Docker en :3000, Vite en :5173). En producción se sobreescribe con la
    // variable de entorno CORS_ALLOWED_ORIGINS con el/los dominios reales.
    @Value("${cors.allowed-origins:http://localhost:3000,http://localhost:5173}")
    private String allowedOriginsProp;

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        List<String> allowedOrigins = Arrays.stream(allowedOriginsProp.split(","))
                .map(String::trim)
                .toList();

        String origin = request.getHeader("Origin");
        if (origin != null && allowedOrigins.contains(origin)) {
            response.setHeader("Access-Control-Allow-Origin", origin);
            response.setHeader("Access-Control-Allow-Credentials", "true");
        }
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "*");
        response.setHeader("Access-Control-Max-Age", "3600");

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
        } else {
            chain.doFilter(req, res);
        }
    }
}