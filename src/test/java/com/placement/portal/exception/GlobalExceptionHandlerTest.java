package com.placement.portal.exception;

import com.placement.portal.dto.ErrorResponse;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void resourceNotFoundProducesNotFoundResponse() {
        ResponseEntity<ErrorResponse> response = handler.handleResourceNotFound(
                new ResourceNotFoundException("Job was not found"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().status()).isEqualTo(HttpStatus.NOT_FOUND.value());
        assertThat(response.getBody().message()).isEqualTo("Job was not found");
        assertThat(response.getBody().timestamp()).isNotNull();
    }

    @Test
    void duplicateResourceProducesConflictResponse() {
        ResponseEntity<ErrorResponse> response = handler.handleDuplicateResource(
                new DuplicateResourceException("Email already exists"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().status()).isEqualTo(HttpStatus.CONFLICT.value());
        assertThat(response.getBody().message()).isEqualTo("Email already exists");
        assertThat(response.getBody().timestamp()).isNotNull();
    }
}
