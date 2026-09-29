package com.codeblue.goldenhour.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** 로컬 프론트(Vite 5173)에서 백엔드(8080)를 직접 호출할 수 있게 한다 해. */
@Configuration
public class WebConfig implements WebMvcConfigurer {

	@Override
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/api/**")
				.allowedOrigins("http://localhost:5173", "http://127.0.0.1:5173")
				.allowedMethods("GET", "POST");
	}
}
