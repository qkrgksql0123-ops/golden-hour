package com.codeblue.goldenhour;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class GoldenHourApplicationTests {

	@Test
	void contextLoads() {
		// 스프링 컨텍스트가 정상적으로 뜨는지만 확인하는 최소 테스트다 해.
		// DB가 없으면 실패하니, 로컬 PostgreSQL을 띄운 상태에서 돌린다 해 (docker-compose 참고).
	}

}
