package ai.inframind.security;

import io.jsonwebtoken.*;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.*;

@Configuration
@EnableWebSecurity
class SecurityConfig {

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    SecurityFilterChain chain(HttpSecurity h, JwtFilter f) throws Exception {
        return h
                .csrf(c -> c.disable())
                .cors(c -> {})
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(a -> a
                        .requestMatchers("/api/auth/**", "/api/public/**", "/actuator/health", "/swagger-ui/**", "/v3/api-docs/**", "/error").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(f, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    org.springframework.web.cors.CorsConfigurationSource cors() {
        var c = new org.springframework.web.cors.CorsConfiguration();
        c.setAllowedOriginPatterns(List.of("*"));
        c.setAllowedMethods(List.of("GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"));
        c.setAllowedHeaders(List.of("Authorization", "Content-Type", "*"));
        c.setAllowCredentials(true);
        var s = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        s.registerCorsConfiguration("/**", c);
        return s;
    }
}

@Component
class JwtFilter extends OncePerRequestFilter {
    private final JwtService jwt;

    JwtFilter(JwtService jwt) {
        this.jwt = jwt;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest r, HttpServletResponse s, FilterChain c)
            throws ServletException, IOException {
        String h = r.getHeader("Authorization");
        System.out.println("DEBUG JWT: Authorization header is: " + (h != null ? (h.length() > 20 ? h.substring(0, 20) + "..." : h) : "NULL"));
        if (h != null && h.startsWith("Bearer ")) {
            try {
                String tokenStr = h.substring(7).trim();
                Claims claims = jwt.read(tokenStr);
                System.out.println("DEBUG JWT: claims = " + claims);
                Object uidObj = claims.get("uid");
                Long uid = null;
                if (uidObj instanceof Number n) {
                    uid = n.longValue();
                } else if (uidObj != null) {
                    try {
                        uid = Long.parseLong(uidObj.toString());
                    } catch (NumberFormatException ignored) {}
                }
                String role = claims.get("role", String.class);
                System.out.println("DEBUG JWT: uid=" + uid + ", role=" + role);

                if (uid != null) {
                    var auth = new UsernamePasswordAuthenticationToken(
                            uid,
                            null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + (role != null ? role : "USER")))
                    );
                    org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(auth);
                    System.out.println("DEBUG JWT: Authentication set in SecurityContextHolder!");
                }
            } catch (Exception ex) {
                System.err.println("DEBUG JWT: Exception reading token: " + ex.getClass().getName() + ": " + ex.getMessage());
                ex.printStackTrace();
            }
        }
        c.doFilter(r, s);
    }
}
