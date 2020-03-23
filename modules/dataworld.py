from datadotworld.config import DefaultConfig
from datadotworld.datadotworld import DataDotWorld

token = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJwcm9kLXVzZXItY2xpZW50OmRhdGFuZWJ1bGFkb3RpbyIsImlzcyI6ImFnZW50OmRhdGFuZWJ1bGFkb3Rpbzo6MTA3YTFlYzEtMzEwOS00NTQ1LWIyNTYtY2FlMDVkY2EzNTMwIiwiaWF0IjoxNTM5NzA1NzUwLCJyb2xlIjpbInVzZXJfYXBpX3JlYWQiLCJ1c2VyX2FwaV93cml0ZSJdLCJnZW5lcmFsLXB1cnBvc2UiOnRydWUsInNhbWwiOnt9fQ.ksAbCRtLN8Okfjm2DcKq0ti4ccl49rUDpuL5GwZG1_MB6DAa13QeNEreBCm7I_raSbG7X4CNiF-RIrlkbsiTiA'
class InlineConfig(DefaultConfig):
    def __init__(self, token):
        super(InlineConfig, self).__init__()
        self._auth_token = token

dw = DataDotWorld(config=InlineConfig(token))
