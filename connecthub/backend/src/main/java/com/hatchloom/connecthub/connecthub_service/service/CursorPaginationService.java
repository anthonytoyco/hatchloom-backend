package com.hatchloom.connecthub.connecthub_service.service;

import com.hatchloom.connecthub.connecthub_service.dto.CursorPaginationRequest;
import com.hatchloom.connecthub.connecthub_service.dto.CursorResponse;
import com.hatchloom.connecthub.connecthub_service.utils.CursorPayload;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.function.BiFunction;
import java.util.function.Function;

/**
 * Service class for handling cursor-based pagination
 */
@Service
public class CursorPaginationService {

    /**
     * Generic method to paginate results using cursor-based pagination.
     * @param request the cursorPaginationRequest
     * @return a CursorResponse containing the paginated items and next cursor information
     * @param <T> the type of items being paginated
     * @param <P> the type of the cursor payload
     */
    public<T, P extends CursorPayload> CursorResponse<T> paginate(
            CursorPaginationRequest<T, P> request
    )
    {
        // Set page size limit
        int pageSize;
        if (request.limit() == null || request.limit() <= 0) {
            pageSize = 25;
        } else {
            pageSize = request.limit();
        }

        // Fetch one more item to determine if there is a next page
        Pageable pageable = Pageable.ofSize(pageSize + 1);
        List<T> items;

        // If no cursor, fetch first page, otherwise fetch next page
        if (request.after() == null || request.after().isBlank()) {
            items = request.firstPageFetcher().apply(pageable);
        } else {
            P payload = request.cursorDecoder().apply(request.after());
            items = request.cursorPageFetcher().apply(payload, pageable);
        }

        boolean hasNext = items.size() > pageSize;
        items = hasNext ? items.subList(0, pageSize) : items;
        String nextCursor = null;

        // If there is a next page, encode the cursor for the last item
        if (hasNext && !items.isEmpty()) {
            T lastItem = items.getLast();
            nextCursor = request.cursorEncoder().apply(request.payloadMapper().apply(lastItem));
        }

        return new CursorResponse<>(items, nextCursor, hasNext);
    }
}
