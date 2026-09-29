package com.codeblue.goldenhour;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GoldenHourApplication {

	public static void main(String[] args) {
		SpringApplication.run(GoldenHourApplication.class, args);
	}

}
