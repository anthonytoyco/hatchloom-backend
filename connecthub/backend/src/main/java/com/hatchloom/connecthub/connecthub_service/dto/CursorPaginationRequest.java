package com.hatchloom.connecthub.connecthub_service.dto;

import com.hatchloom.connecthub.connecthub_service.utils.CursorPayload;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.function.BiFunction;
import java.util.function.Function;

public record CursorPaginationRequest<T, P extends CursorPayload> (
        String after,
        Integer limit,
        Function<Pageable, List<T>> firstPageFetcher,
        BiFunction<P, Pageable, List<T>> cursorPageFetcher,
        Function<String, P> cursorDecoder,
        Function<P, String> cursorEncoder,
        Function<T, P> payloadMapper
) {
}
