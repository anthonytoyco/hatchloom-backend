package com.hatchloom.connecthub.connecthub_service.service;

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
     * @param after the next cursor
     * @param limit the max number of items to return
     * @param firstPageFetcher function to fetch the first page of results
     * @param cursorPageFetcher function to fetch next pages of results
     * @param cursorDecoder function to decode the cursor string
     * @param cursorEncoder function to encode the cursor string
     * @param payloadMapper function to map an item to its cursor payload
     * @return a CursorResponse containing the paginated items and next cursor information
     * @param <T> the type of items being paginated
     * @param <P> the type of the cursor payload
     */
    public<T, P extends CursorPayload> CursorResponse<T> paginate(
            String after,
            Integer limit,
            Function<Pageable, List<T>> firstPageFetcher,
            BiFunction<P, Pageable, List<T>> cursorPageFetcher,
            Function<String, P> cursorDecoder,
            Function<P, String> cursorEncoder,
            Function<T, P> payloadMapper
            )
    {
        // Set page size limit
        int pageSize;
        if (limit == null || limit <= 0) {
            pageSize = 25;
        } else {
            pageSize = limit;
        }

        // Fetch one more item to determine if there is a next page
        Pageable pageable = Pageable.ofSize(pageSize + 1);
        List<T> items;

        // If no cursor, fetch first page, otherwise fetch next page
        if (after == null || after.isBlank()) {
            items = firstPageFetcher.apply(pageable);
        } else {
            P payload = cursorDecoder.apply(after);
            items = cursorPageFetcher.apply(payload, pageable);
        }

        boolean hasNext = items.size() > pageSize;
        items = hasNext ? items.subList(0, pageSize) : items;
        String nextCursor = null;

        // If there is a next page, encode the cursor for the last item
        if (hasNext && !items.isEmpty()) {
            T lastItem = items.getLast();
            nextCursor = cursorEncoder.apply(payloadMapper.apply(lastItem));
        }

        return new CursorResponse<>(items, nextCursor, hasNext);
    }
}
