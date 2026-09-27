package com.placement.portal.dto;

import java.util.Map;

public class AiResponse {

    private boolean success;
    private String response;
    private String message;
    private Map<String, String> data;

    public AiResponse() {
    }

    public AiResponse(boolean success, String response) {
        this(success, response, success ? "AI response generated successfully" : "Failed to generate AI response");
    }

    public AiResponse(boolean success, String response, String message) {
        this.success = success;
        this.response = response;
        this.message = message;
        this.data = response != null ? Map.of("response", response) : Map.of();
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getResponse() {
        return response;
    }

    public void setResponse(String response) {
        this.response = response;
        this.data = response != null ? Map.of("response", response) : Map.of();
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Map<String, String> getData() {
        return data;
    }

    public void setData(Map<String, String> data) {
        this.data = data;
    }
}
