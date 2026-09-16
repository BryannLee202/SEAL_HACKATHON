package com.seal.hackathon.dto.vote;

import java.util.UUID;

public record MyVoteResponse(
        UUID votedTeamId
) {
}
