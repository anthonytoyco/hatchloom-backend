package com.hatchloom.launchpad.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * Request body for updating a single Business Model Canvas section.
 *
 * <p>
 * {@code section} must be one of the 9 valid BMC section keys
 * (e.g. {@code "value_propositions"}, {@code "key_partners"}).
 * Unknown keys are rejected with 400 Bad Request.
 * </p>
 */
public class EditBMCRequest {

    @NotBlank
    @Pattern(regexp = "(?i)key_partners|key_activities|key_resources|value_propositions"
            + "|customer_relationships|channels|customer_segments|cost_structure|revenue_streams", message = "section must be one of: key_partners, key_activities, key_resources, "
                    + "value_propositions, customer_relationships, channels, "
                    + "customer_segments, cost_structure, revenue_streams")
    private String section;

    private String content;

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
